using LaundryAPI.DTOs;
using LaundryAPI.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace LaundryAPI.Filters
{
    /// <summary>
    /// Global Exception Filter để bắt và xử lý tất cả exceptions
    /// </summary>
    public class GlobalExceptionFilter : IExceptionFilter
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<GlobalExceptionFilter> _logger;

        public GlobalExceptionFilter(
            IWebHostEnvironment environment,
            ILogger<GlobalExceptionFilter> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public void OnException(ExceptionContext context)
        {
            var exception = context.Exception;
            var errorResponse = new ErrorResponse();

            // Log exception
            _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

            // Xử lý các loại exception khác nhau
            // Lưu ý: Đặt các exception cụ thể trước các exception tổng quát hơn
            switch (exception)
            {
                // Custom Business Exceptions (đặt trước vì có thể kế thừa từ Exception)
                case UserFriendlyException userFriendlyEx:
                    errorResponse.Error = new ErrorInfo
                    {
                        Code = userFriendlyEx.Code ?? "USER_FRIENDLY_ERROR",
                        Message = userFriendlyEx.Message,
                        Details = userFriendlyEx.Details
                    };
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;

                case BusinessException businessEx:
                    errorResponse.Error = new ErrorInfo
                    {
                        Code = businessEx.Code ?? "BUSINESS_ERROR",
                        Message = businessEx.Message,
                        Details = businessEx.Details,
                        Data = businessEx.ErrorData != null ? ConvertToDictionary(businessEx.ErrorData) : null
                    };
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;

                // Database Exceptions (đặt DbUpdateConcurrencyException trước DbUpdateException)
                case DbUpdateConcurrencyException:
                    errorResponse.Error = new ErrorInfo
                    {
                        Code = "CONCURRENCY_ERROR",
                        Message = "Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng làm mới và thử lại.",
                        Details = _environment.IsDevelopment() ? exception.Message : null
                    };
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.Conflict;
                    break;

                case DbUpdateException dbEx:
                    errorResponse.Error = new ErrorInfo
                    {
                        Code = "DATABASE_ERROR",
                        Message = "Đã xảy ra lỗi khi thao tác với cơ sở dữ liệu",
                        Details = _environment.IsDevelopment() ? dbEx.InnerException?.Message ?? dbEx.Message : null
                    };
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;

                // Argument Exceptions (đặt ArgumentNullException trước ArgumentException)
                case ArgumentNullException argNullEx:
                    errorResponse.Error = new ErrorInfo
                    {
                        Code = "NOT_FOUND",
                        Message = argNullEx.Message,
                        Details = _environment.IsDevelopment() ? exception.StackTrace : null
                    };
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;

                case ArgumentException argEx:
                    errorResponse.Error = new ErrorInfo
                    {
                        Code = "INVALID_ARGUMENT",
                        Message = argEx.Message,
                        Details = _environment.IsDevelopment() ? exception.StackTrace : null
                    };
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;

                // Security Exceptions
                case UnauthorizedAccessException:
                case SecurityTokenException:
                    errorResponse.Error = new ErrorInfo
                    {
                        Code = "UNAUTHORIZED",
                        Message = "Bạn không có quyền truy cập tài nguyên này",
                        Details = _environment.IsDevelopment() ? exception.Message : null
                    };
                    errorResponse.UnauthorizedRequest = true;
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    break;

                // Not Found Exceptions
                case KeyNotFoundException:
                    errorResponse.Error = new ErrorInfo
                    {
                        Code = "NOT_FOUND",
                        Message = exception.Message,
                        Details = _environment.IsDevelopment() ? exception.StackTrace : null
                    };
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    break;

                // Default: Tất cả các exception khác
                default:
                    errorResponse.Error = new ErrorInfo
                    {
                        Code = "INTERNAL_SERVER_ERROR",
                        Message = _environment.IsDevelopment() 
                            ? exception.Message 
                            : "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
                        Details = _environment.IsDevelopment() ? exception.StackTrace : null
                    };
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            // Tạo response
            context.Result = new JsonResult(errorResponse)
            {
                StatusCode = context.HttpContext.Response.StatusCode
            };

            // Đánh dấu exception đã được xử lý
            context.ExceptionHandled = true;
        }

        private Dictionary<string, object>? ConvertToDictionary(object data)
        {
            if (data == null) return null;

            var dictionary = new Dictionary<string, object>();
            var properties = data.GetType().GetProperties();

            foreach (var prop in properties)
            {
                var value = prop.GetValue(data);
                if (value != null)
                {
                    dictionary[prop.Name] = value;
                }
            }

            return dictionary.Count > 0 ? dictionary : null;
        }
    }
}

