using Domain.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastucture.EntityConfigurations
{
    public class PermissionGroupConfiguration : IEntityTypeConfiguration<PermissionGroup>
    {
        public void Configure(EntityTypeBuilder<PermissionGroup> builder)
        {
            builder.ToTable("PermissionGroups");

            builder.HasKey(pg => pg.Id);

            builder.Property(pg => pg.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(pg => pg.Description)
                .HasMaxLength(1000);

            builder.OwnsOne(pg => pg.Permissions, pb =>
            {
                pb.ToJson();
                pb.Property(p => p.Items);
            });

            builder.HasOne(pg => pg.Company)
                .WithMany()
                .HasForeignKey(pg => pg.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(pg => new { pg.Name, pg.CompanyId })
                .IsUnique();
        }
    }
}

