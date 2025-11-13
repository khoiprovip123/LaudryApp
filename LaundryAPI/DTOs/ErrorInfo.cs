using System.Collections.Generic;

namespace LaundryAPI.DTOs
{
    /// <summary>
    /// Thông tin lỗi theo chuẩn ABP Framework
    /// </summary>
    public class ErrorInfo
    {
        public string? Code { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
        public Dictionary<string, object>? Data { get; set; }
        public List<ValidationErrorInfo>? ValidationErrors { get; set; }
    }

    /// <summary>
    /// Thông tin lỗi validation
    /// </summary>
    public class ValidationErrorInfo
    {
        public string Message { get; set; } = string.Empty;
        public List<string> Members { get; set; } = new();
    }
}

