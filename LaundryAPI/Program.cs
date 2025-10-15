using Infrastucture.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

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
services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

services.AddControllers();
services.AddEndpointsApiExplorer();
services.AddSwaggerGen();
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
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
