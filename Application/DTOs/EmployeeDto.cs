namespace Application.DTOs
{
    public class EmployeeDto
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public Guid? CompanyId { get; set; }
        public string CompanyName { get; set; }
        public bool IsUserRoot { get; set; }
        public bool Active { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }
}

