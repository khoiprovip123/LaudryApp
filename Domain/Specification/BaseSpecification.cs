using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace Domain.Specifications
{
    public abstract class BaseSpecification<T> : CompositeSpecification<T>
    {
        protected BaseSpecification(Expression<Func<T, bool>> criteria)
        {
            Criteria = criteria;
        }

        protected virtual void AddInclude(Expression<Func<T, object>> includeExpression)
        {
            Includes.Add(includeExpression);
        }
        protected virtual void AddInclude(string includeString)
        {
            IncludeStrings.Add(includeString);
        }
        protected virtual void ApplyPaging(int skip, int take)
        {
            Skip = skip;
            Take = take;
            IsPagingEnabled = true;
        }
        protected virtual void ApplyOrderBy(Expression<Func<T, object>> orderByExpression)
        {
            OrderBy = orderByExpression;
        }
        protected virtual void ApplyOrderByDescending(Expression<Func<T, object>> orderByDescendingExpression)
        {
            OrderByDescending = orderByDescendingExpression;
        }

        //Not used anywhere at the moment, but someone requested an example of setting this up.
        protected virtual void ApplyGroupBy(Expression<Func<T, object>> groupByExpression)
        {
            GroupBy = groupByExpression;
        }

        public override Expression<Func<T, bool>> AsExpression()
        {
            return Criteria;
        }

        public override bool IsSatisfiedBy(T candidate)
        {
            return Criteria.Compile()(candidate);
        }
    }
}
