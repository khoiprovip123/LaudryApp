using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationCore.Caching;

public class CompanyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }

    public Guid PartnerId { get; set; }

    public string Email { get; set; }

    public string Phone { get; set; }

    public DateTime? PeriodLockDate { get; set; }

    /// <summary>
    /// Tài khoản doanh thu
    /// </summary>
    public Guid? AccountIncomeId { get; set; }

    /// <summary>
    /// Tài khoản chi phí
    /// </summary>
    public Guid? AccountExpenseId { get; set; }

    public string Logo { get; set; }

    /// <summary>
    /// Trạng thái chi nhánh
    /// </summary>
    public bool Active { get; set; }


    public string ReportHeader { get; set; }

    public string ReportFooter { get; set; }
    public bool NotAllowExportInventoryNegative { get; set; }

    public string MedicalFacilityCode { get; set; }

    /// <summary>
    /// Là Head office
    /// </summary>
    public bool IsHead { get; set; }
    public bool IsUppercasePartnerName { get; set; }

    public string Address { get; set; }

    public string Website { get; set; }

    public string Hotline { get; set; }

    public bool PaymentSmsValidation { get; set; }

    public Guid? PaymentSmsValidationTemplateId { get; set; }

    public Guid? CurrencyId { get; set; }
    public Guid? EInvoiceTemplateId { get; set; }
    public Guid? EInvoiceAccountId { get; set; }
    public IEnumerable<Guid> HouseholdBusinessId { get; set; }
    public Guid? DefaultHouseholdId { get; set; }
}
