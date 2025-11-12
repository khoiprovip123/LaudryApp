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

        public string Name { get; set; }
        public string Ref
        {
            get
            {
                return _ref;
            }
            set
            {
                _ref = value;
                DisplayName = _NameGet;
                ComputeSplitSequence();
            }
        }
        public string _NameGet
        {
            get
            {
                var name = Name;
                if (!string.IsNullOrEmpty(Ref))
                {
                    if (IsCustomer)
                        name = Name + " [" + Ref + "]";
                    else
                        name = "[" + Ref + "] " + Name;
                }
                return name;
            }
        }
        public string DisplayName { get; set; }
        private string _ref;
        public string SequencePrefix { get; set; }
        public int? SequenceNumber { get; set; }

        public string NameNoSign { get; set; }
        public bool IsCustomer { get; set; }
        public bool IsCompany { get; set; }
        public string Phone { get; set; }
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
        public Company Company { get; set; }
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }


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
