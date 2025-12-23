using Domain.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastucture.EntityConfigurations
{
    public class PaymentOrderConfiguration : IEntityTypeConfiguration<PaymentOrder>
    {
        public void Configure(EntityTypeBuilder<PaymentOrder> builder)
        {

            builder.HasOne(x => x.Payment)
                   .WithMany(p => p.PaymentOrders)
                   .HasForeignKey(x => x.PaymentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Order)
                   .WithMany(o => o.PaymentOrders)
                   .HasForeignKey(x => x.OrderId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Company)
                   .WithMany()
                   .HasForeignKey(x => x.CompanyId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.CompanyId, x.DateCreated });
        }
    }

}
