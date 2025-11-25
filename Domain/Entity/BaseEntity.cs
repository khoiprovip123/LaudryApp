using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
using Domain.Interfaces;

namespace Domain.Entity
{
    public abstract class BaseEntity : IEntity<Guid>
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public Guid Id { get; protected set; }

        public string? CreatedById { get; set; }
        public ApplicationUser? CreatedBy { get; set; }

        public string? UpdateById { get; set; }
        public ApplicationUser? UpdateBy { get; set; }

        public DateTime DateCreated { get; protected set; }

        public DateTime LastUpdated { get;  set; }

        protected BaseEntity()
        {
            var time = DateTime.Now;
            DateCreated = time;
            LastUpdated = time;
            Id = Guid.NewGuid();
        }
    }

    public abstract class BaseEntity<TKey> : IEntity<TKey> where TKey : notnull
    {
        public virtual TKey Id { get; protected set; } = default!;
    }
}
