using System.Diagnostics;

namespace LaundryAPI.Exceptions
{
    /// <summary>
    /// Exception cho các lỗi thân thiện với người dùng (hiển thị trực tiếp cho user)
    /// </summary>
    [DebuggerNonUserCode]
    public class UserFriendlyException : BusinessException
    {
        [DebuggerStepThrough]
        public UserFriendlyException(string message) : base(message)
        {
        }

        [DebuggerStepThrough]
        public UserFriendlyException(string message, string? code) : base(message, code)
        {
        }

        [DebuggerStepThrough]
        public UserFriendlyException(string message, string? code, string? details) : base(message, code, details)
        {
        }
    }
}

