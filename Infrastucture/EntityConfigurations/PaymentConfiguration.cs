using Domain.Entity;
using Infrastucture.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastucture.EntityConfigurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.HasOne(x => x.Company)
           .WithMany()
           .HasForeignKey(x => x.CompanyId);

            builder.HasOne(x => x.Order)
              .WithMany()
              .HasForeignKey(x => x.OrderId);

            builder.ConfigureBaseEntity();
        }
    }
}
