using Domain.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastucture.EntityConfigurations
{
    public class EmployeePermissionGroupConfiguration : IEntityTypeConfiguration<EmployeePermissionGroup>
    {
        public void Configure(EntityTypeBuilder<EmployeePermissionGroup> builder)
        {
            builder.ToTable("EmployeePermissionGroups");

            builder.HasKey(epg => epg.Id);

            builder.HasOne(epg => epg.Employee)
                .WithMany()
                .HasForeignKey(epg => epg.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(epg => epg.PermissionGroup)
                .WithMany(pg => pg.EmployeePermissionGroups)
                .HasForeignKey(epg => epg.PermissionGroupId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(epg => new { epg.EmployeeId, epg.PermissionGroupId })
                .IsUnique();
        }
    }
}

