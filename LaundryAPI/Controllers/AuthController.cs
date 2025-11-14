using Application.DTOs;
using Domain.Entity;
using Domain.Service;
using LHK.Security.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _config;
        private readonly ICompanyService _companyService;


        public AuthController(IMediator mediator, SignInManager<ApplicationUser> signInManager, IConfiguration config, UserManager<ApplicationUser> userManager, ICompanyService companyService)
        {
            _mediator = mediator;
            _signInManager = signInManager;
            _config = config;
            _userManager = userManager;
            _companyService = companyService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var user = await _userManager.Users.Where(x => x.UserName == model.UserName).Include(x => x.Company).FirstOrDefaultAsync();
            if (user == null)
                throw new UserFriendlyException($"Tên đăng nhập {model.UserName} không tồn tại", "USER_NOT_FOUND");

            if (!user.Active)
                throw new UserFriendlyException($"Tên đăng nhập {model.UserName} không khả dụng", "USER_INACTIVE");

            //if (user.Company?.Active == false)
            //    throw new UserFriendlyException($"Tên đăng nhập {model.UserName} không thể truy cập vào chi nhánh đã bị đóng", "COMPANY_INACTIVE");

            var result = await _signInManager.PasswordSignInAsync(model.UserName, model.Password, false, lockoutOnFailure: false);

            if (result.Succeeded)
            {
                return Ok(new LoginResponse
                {
                    Succeeded = true,
                    Token = GenerateToken(user, DateTime.UtcNow.AddDays(7)),
                    Message = "Authentication succeeded",
                });
            }
            else
            {
                throw new UserFriendlyException("Tên đăng nhập hoặc mật khẩu không đúng", "INVALID_CREDENTIALS");
            }
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest dto)
        {
            var existingUser = await _userManager.FindByNameAsync(dto.UserName);
            if (existingUser != null)
                throw new UserFriendlyException("Tên đăng nhập đã tồn tại", "USERNAME_EXISTS");

            var user = new ApplicationUser
            {
                UserName = dto.UserName,
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new UserFriendlyException($"Không thể tạo tài khoản: {errors}", "REGISTRATION_FAILED");
            }

            // Sinh JWT token trả về luôn (tuỳ chọn)
            var token = GenerateToken(user, DateTime.UtcNow.AddHours(2));

            return Ok(new
            {
                message = "Register success!",
                token
            });
        }

        [HttpGet] public IActionResult Get() => Ok("ok");

        [HttpGet("session")]
        public async Task<IActionResult> GetSession()
        {
            var userId = UserId;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.Users
                .Where(x => x.Id.ToString() == userId)
                .Include(x => x.Company)
                .FirstOrDefaultAsync();

            if (user == null)
                return Unauthorized();


            return Ok(new SessionInfoResponse
            {
                UserId = user.Id.ToString(),
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                CompanyId = user.CompanyId,
                CompanyName = user.Company?.CompanyName ?? string.Empty,
                IsSuperAdmin = user.IsSuperAdmin,
            });
        }

        //private string GenerateToken(ApplicationUser user, DateTime expires, IList<string>? roles = null, string? sid = null)
        //{
        //    roles ??= new List<string>();

        //    var handler = new JwtSecurityTokenHandler();
        //   // var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))));
        //    var keyBytes = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
        //    var key = new SymmetricSecurityKey(keyBytes);

        //    var claims = new List<Claim>
        //    {
        //     new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        //     new Claim(ClaimTypes.Name, user.UserName),
        //     new Claim("company_id", user.CompanyId.ToString()),
        //     new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        //    };


        //    if (!string.IsNullOrEmpty(sid))
        //        claims.Add(new Claim("sid", sid));

        //    // Add roles if exists
        //    foreach (var role in roles)
        //    {
        //        claims.Add(new Claim(ClaimTypes.Role, role));
        //    }

        //    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        //    var token = new JwtSecurityToken(
        //        issuer: _config["Jwt:Issuer"],
        //        audience: _config["Jwt:Audience"],
        //        claims: claims,
        //        expires: expires,
        //        signingCredentials: creds
        //    );

        //    return handler.WriteToken(token);
        //}

        private string GenerateToken(ApplicationUser user, DateTime expiresUtc, IList<string>? roles = null, string? sid = null)
        {
            roles ??= new List<string>();

            var handler = new JwtSecurityTokenHandler();
            var claims = new List<Claim>{
                         new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                         new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                         new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Nếu có CompanyId (nullable) thì thêm claim an toàn
            if (user.CompanyId != null)
                claims.Add(new Claim("company_id", user.CompanyId.ToString()!));

            // Super admin: cờ lưu trong bảng AspNetUsers
            var isSuperAdmin = user.IsSuperAdmin;
            claims.Add(new Claim("is_super_admin", isSuperAdmin ? "true" : "false"));

            // Thêm các role (nếu có)
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Tạo credentials ký token: Key lưu ở cấu hình là Base64, cần decode
            var keyBase64 = _config["Jwt:Key"]!;
            byte[] keyBytes;
            try
            {
                keyBytes = Convert.FromBase64String(keyBase64);
            }
            catch
            {
                // Fallback: nếu key không phải Base64 (môi trường cũ), dùng UTF8
                keyBytes = Encoding.UTF8.GetBytes(keyBase64);
            }
            var key = new SymmetricSecurityKey(keyBytes);
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: expiresUtc.Kind == DateTimeKind.Utc ? expiresUtc : expiresUtc.ToUniversalTime(),
                signingCredentials: creds
            );

            return handler.WriteToken(token);
        }

    }
}


