using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Domain.Entity
{
    public class Partner : BaseEntity
    {
        public Partner()
        {
            Active = true;
        }

        public string Name 
        { 
            get => _name;
            set
            {
                _name = value;
                UpdateDisplayName();
            }
        }
        private string _name;
        
        public string Ref
        {
            get
            {
                return _ref;
            }
            set
            {
                _ref = value;
                UpdateDisplayName();
                ComputeSplitSequence();
            }
        }
        public string _NameGet
        {
            get
            {
                // Format: [mã]tên-3 số cuối
                var result = string.Empty;
                
                // Thêm mã (Ref) trong ngoặc vuông nếu có
                if (!string.IsNullOrEmpty(Ref))
                {
                    result = "[" + Ref + "]";
                }
                
                // Thêm tên (không có khoảng trắng sau ngoặc vuông)
                if (!string.IsNullOrEmpty(Name))
                {
                    result += Name;
                }
                
                // Thêm 3 số cuối số điện thoại nếu có
                var phoneLastThree = GetPhoneLastThreeDigits();
                if (!string.IsNullOrEmpty(phoneLastThree))
                {
                    result += "-" + phoneLastThree;
                }
                
                return result;
            }
        }
        
        private string GetPhoneLastThreeDigits()
        {
            // Nếu đã có PhoneLastThreeDigits thì dùng nó
            if (!string.IsNullOrEmpty(PhoneLastThreeDigits))
                return PhoneLastThreeDigits;
            
            // Nếu không có PhoneLastThreeDigits nhưng có Phone thì lấy 3 số cuối từ Phone
            if (!string.IsNullOrEmpty(Phone))
            {
                var digitsOnly = new System.Text.RegularExpressions.Regex(@"\d+").Matches(Phone);
                if (digitsOnly.Count > 0)
                {
                    var lastMatch = digitsOnly[digitsOnly.Count - 1];
                    if (lastMatch.Value.Length >= 3)
                        return lastMatch.Value.Substring(lastMatch.Value.Length - 3);
                    else if (lastMatch.Value.Length > 0)
                        return lastMatch.Value;
                }
            }
            
            return string.Empty;
        }
        public string DisplayName { get; set; }
        private string _ref;
        public string SequencePrefix { get; set; }
        public int? SequenceNumber { get; set; }
        
        private void UpdateDisplayName()
        {
            DisplayName = _NameGet;
        }

        public string NameNoSign { get; set; }
        public bool IsCustomer { get; set; }
        public bool IsCompany { get; set; }
        public string Phone 
        { 
            get => _phone;
            set
            {
                _phone = value;
                UpdateDisplayName();
            }
        }
        private string _phone;
        
        public string? PhoneLastThreeDigits 
        { 
            get => _phoneLastThreeDigits;
            set
            {
                _phoneLastThreeDigits = value;
                UpdateDisplayName();
            }
        }
        private string? _phoneLastThreeDigits;
        public string? Notes { get; set; }
        public string? Address { get; set; }
        public string? CityCode { get; set; }
        public string? CityName { get; set; }
        public string? DistrictCode { get; set; }
        public string? DistrictName { get; set; }
        public string? WardCode { get; set; }
        public string? WardName { get; set; }
        public bool Active { get; set; }
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public Guid? CompanyId { get; set; }
        public Company? Company { get; set; }
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }


        public void ComputeSplitSequence()
        {
            if (string.IsNullOrEmpty(Ref) || Ref == "/")
                return;

            Regex rx = new Regex(@"^(?:.*?)(\d{0,9})(?:\D*?)$", RegexOptions.Compiled | RegexOptions.IgnoreCase);
            var match = rx.Match(Ref);
            if (match.Success)
            {
                try
                {
                    SequencePrefix = Ref.Substring(0, match.Groups[1].Index);
                    SequenceNumber = Convert.ToInt32(match.Groups[1].Value);
                }
                catch
                {
                }
            }
        }
    }
}
