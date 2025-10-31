using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class PagedResult<T> where T : class
    {

        [DataMember(Name = "offset")]
        public long Offset { get; private set; }

        [DataMember(Name = "limit")]
        public long Limit { get; private set; }

        [DataMember(Name = "totalItems")]
        public long TotalItems { get; private set; }
        public IEnumerable<T> Items { get; set; }

        public PagedResult(long totalItems, long offset, long limit)
        {
            TotalItems = totalItems;
            Offset = offset;
            Limit = limit;
        }
    }
    }
