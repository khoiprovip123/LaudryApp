using Domain.Entity;
using Domain.Service;
using LaundryAPI.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaundryAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class IRSequencesController : BaseApiController
	{
		private readonly IIRSequenceService _sequenceService;

		public IRSequencesController(IIRSequenceService sequenceService)
		{
			_sequenceService = sequenceService;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll([FromQuery] int offset = 0, [FromQuery] int limit = 50)
		{
			var query = _sequenceService.SearchQuery();
			var total = await query.CountAsync();
			// AsNoTracking() đã được áp dụng trong SearchQuery(), chỉ cần select và execute
			var items = await query
				.OrderBy(s => s.Code)
				.Skip(offset)
				.Take(limit)
				.ToListAsync();
			return Ok(new { total, offset, limit, items });
		}

		[HttpGet("{id:guid}")]
		public async Task<IActionResult> GetById(Guid id)
		{
			var item = await _sequenceService.GetByIdAsync(id);
			if (item == null) return NotFound();
			return Ok(item);
		}

		[Uow]
		[HttpPost]
		public async Task<IActionResult> Create([FromBody] IRSequence dto)
		{
			var entity = await _sequenceService.CreateAsync(dto);
			return Ok(entity);
		}

		[Uow]
		[HttpPut("{id}")]
		public async Task<IActionResult> Update(Guid id, [FromBody] IRSequence dto)
		{
			var exist = await _sequenceService.GetByIdAsync(id);
			if (exist == null) return NotFound();

			exist.Code = dto.Code;
			exist.Prefix = dto.Prefix;
			exist.Padding = dto.Padding;
			exist.NumberNext = dto.NumberNext;
			exist.NumberIncrement = dto.NumberIncrement;
			exist.Implementation = dto.Implementation;
			exist.CompanyId = dto.CompanyId;

			await _sequenceService.UpdateAsync(exist);
			return Ok(exist);
		}

		[Uow]
		[HttpDelete("{id:guid}")]
		public async Task<IActionResult> Delete(Guid id)
		{
			var exist = await _sequenceService.GetByIdAsync(id);
			if (exist == null) return NotFound();
			await _sequenceService.DeleteAsync(exist);
			return NoContent();
		}
	}
}

