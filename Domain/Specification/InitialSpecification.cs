using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace Domain.Specifications
{
    public class InitialSpecification<T> : BaseSpecification<T>
    {
        public InitialSpecification(Expression<Func<T, bool>> criteria) : base(criteria)
        {
        }
    }
}
