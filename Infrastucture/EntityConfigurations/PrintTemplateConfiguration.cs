using Domain.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastucture.EntityConfigurations
{
    public class PrintTemplateConfiguration : IEntityTypeConfiguration<PrintTemplate>
    {
        public void Configure(EntityTypeBuilder<PrintTemplate> builder)
        {
            builder.ToTable("PrintTemplates");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.TemplateType)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.HtmlTemplate)
                .HasColumnType("nvarchar(max)");

            builder.Property(x => x.CssStyles)
                .HasColumnType("nvarchar(max)");

            builder.Property(x => x.Description)
                .HasMaxLength(500);

            builder.HasOne(x => x.Company)
                .WithMany()
                .HasForeignKey(x => x.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.CompanyId, x.TemplateType, x.IsDefault });
        }
    }
}

