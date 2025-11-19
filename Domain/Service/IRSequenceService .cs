using Domain.Service;
using Domain.Entity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Service
{
    public class IRSequenceService : BaseService<IRSequence>, IIRSequenceService
    {
			private readonly IAsyncRepository<IRSequence> _sequenceRepository;

			public IRSequenceService(IAsyncRepository<IRSequence> repository, IHttpContextAccessor httpContextAccessor) : base(repository, httpContextAccessor)
			{
				_sequenceRepository = repository;
			}

			public async Task<string> GetNextRefAsync(string code, Guid? companyId, CancellationToken cancellationToken = default)
			{
				// Tìm hoặc tạo sequence theo code + company
				var query = _sequenceRepository.SearchQuery(s => s.Code == code && s.CompanyId == companyId);
				var seq = await query.FirstOrDefaultAsync(cancellationToken);
				if (seq == null)
				{
					seq = new IRSequence
					{
						Code = code,
						CompanyId = companyId,
						Prefix = code?.Length > 0 ? code[..Math.Min(3, code.Length)].ToUpperInvariant() : "SEQ",
						Padding = 5,
						NumberNext = 1,
						NumberIncrement = 1,
						Implementation = "no_gap"
					};
					await _sequenceRepository.InsertAsync(seq);
				}

				var nextNumber = seq.NumberNext;
				var refStr = $"{seq.Prefix}{nextNumber.ToString().PadLeft(seq.Padding, '0')}";

				// Tăng số cho lần tiếp theo (không autosave để UoW commit)
				seq.NumberNext = nextNumber + (seq.NumberIncrement <= 0 ? 1 : seq.NumberIncrement);
				await _sequenceRepository.UpdateAsync(new[] { seq }, autoSave: false);

				return refStr;
			}
    }
}
