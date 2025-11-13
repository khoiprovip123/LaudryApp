namespace LaundryAPI.DTOs
{
    /// <summary>
    /// Response lỗi chuẩn cho API
    /// </summary>
    public class ErrorResponse
    {
        public ErrorInfo Error { get; set; } = new();
        public string? TargetUrl { get; set; }
        public bool UnauthorizedRequest { get; set; }
        public bool Success { get; set; } = false;
    }
}

