using System;

namespace Domain.Interfaces
{
    public interface IEntity
    {
    }

    public interface IEntity<TKey> : IEntity
    {
        /// <summary>
        /// Unique identifier for this entity.
        /// </summary>
        TKey Id { get; }
    }

    public interface IAggregateRoot : IEntity
    {

    }

    /// <summary>
    /// Defines an aggregate root with a single primary key with "Id" property.
    /// </summary>
    /// <typeparam name="TKey">Type of the primary key of the entity</typeparam>
    public interface IAggregateRoot<TKey> : IEntity<TKey>, IAggregateRoot
    {

    }
}


