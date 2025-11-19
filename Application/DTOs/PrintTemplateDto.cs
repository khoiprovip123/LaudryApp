using System;

namespace Application.DTOs
{
    public class PrintTemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string TemplateType { get; set; }
        public string HtmlTemplate { get; set; }
        public string CssStyles { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public string Description { get; set; }
        public Guid? CompanyId { get; set; }
    }

    public class PrintTemplatePreviewDto
    {
        public Guid TemplateId { get; set; }
        public string TemplateName { get; set; }
        public string RenderedHtml { get; set; }
    }
}

