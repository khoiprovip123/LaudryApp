using Application;
using Domain;
using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using Infrastucture;
using Infrastucture.Data;
using Infrastucture.Interfaces;
using Infrastucture.Repository;
using LaundryAPI.Filters;
using LHK.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configuration shortcuts
var services = builder.Services;
var configuration = builder.Configuration;
var environment = builder.Environment;

// Services
var connectionString = configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Missing connection string 'DefaultConnection'.");

services.AddDbContext<LaundryDbContext>(options =>
    options.UseSqlServer(connectionString));

services.AddRouting(options => options.LowercaseUrls = true);

services.ConfigureDomainServices(configuration);
services.ConfigureInfraServices(configuration);
services.ConfigureApplicationServices(configuration);

// Đăng ký IHttpContextAccessor (cần cho CurrentPrincipalAccessor)
services.AddHttpContextAccessor();

// Đăng ký Security services (ICurrentUser, ICurrentPrincipalAccessor)
services.AddUsersServices();

builder.Services.AddScoped<IDbContextProvider<LaundryDbContext>, DbContextProvider<LaundryDbContext>>();
services.AddScoped<IUnitOfWork, EfUnitOfWork>();


services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});


services.AddMediatR(cfg =>
{
    // Nếu handler nằm trong project Application
    cfg.RegisterServicesFromAssemblies(Assembly.GetExecutingAssembly());
});


// Cấu hình Identity
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<LaundryDbContext>()
.AddDefaultTokenProviders();



var jwtSettings = builder.Configuration.GetSection("Jwt");
// Giải mã Base64 để lấy key thực (tránh dùng bytes của chuỗi Base64)
var key = Convert.FromBase64String(jwtSettings["Key"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // chỉ bật false khi dev
    options.SaveToken = true;
    options.IncludeErrorDetails = true; // Hiện chi tiết lỗi khi dev
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero,

        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    // Nhật ký lỗi xác thực để debug 401
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            context.Response.Headers.Append("Token-Error", context.Exception.Message);
            if (context.Exception is SecurityTokenExpiredException expired)
            {
                context.Response.Headers.Append("Token-Expired", expired.Expires.ToUniversalTime().ToString("o"));
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();
services.AddControllers(options =>
{
    // Đăng ký Global Exception Filter
    options.Filters.Add<GlobalExceptionFilter>();
});
services.AddEndpointsApiExplorer();
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Laundry API",
        Version = "v1",
        Description = "API quản lý tiệm giặt ủi"
    });

    // 🔒 Cấu hình Bearer token cho Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập token JWT dạng: Bearer {your token here}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

services.AddHealthChecks();

var app = builder.Build();

// Pipeline
if (environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("DefaultCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
