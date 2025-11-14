using System.Diagnostics;

 namespace LHK.Security.Exceptions
{
    /// <summary>
    /// Exception cho các lỗi business logic
    /// </summary>
    [DebuggerNonUserCode]
    public class BusinessException : Exception
    {
        public string? Code { get; set; }
        public string? Details { get; set; }
        public object? ErrorData { get; set; }

        [DebuggerStepThrough]
        public BusinessException(string message) : base(message)
        {
        }

        [DebuggerStepThrough]
        public BusinessException(string message, string? code) : base(message)
        {
            Code = code;
        }

        [DebuggerStepThrough]
        public BusinessException(string message, string? code, string? details) : base(message)
        {
            Code = code;
            Details = details;
        }

        [DebuggerStepThrough]
        public BusinessException(string message, string? code, string? details, object? errorData) : base(message)
        {
            Code = code;
            Details = details;
            ErrorData = errorData;
        }
    }
}

