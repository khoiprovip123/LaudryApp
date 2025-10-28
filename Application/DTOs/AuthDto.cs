using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class AuthDto
    {
    }

    public class LoginRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }

    public class LoginResponse
    {
        public bool Succeeded { get; set; } = false;
        public string Message { get; set; }
        public string Token { get; set; }
    }

    public class RegisterRequest
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public string Phone { get; set; }
    }
}
