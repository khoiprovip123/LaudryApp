using Application.DTOs;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Orders.Queries
{
    public class GetOrderPrintWithTemplateQuery : IRequest<PrintTemplatePreviewDto>
    {
        public Guid OrderId { get; set; }
        public string PrintType { get; set; } = "Receive";
        public Guid? TemplateId { get; set; }
    }

    public class GetOrderPrintWithTemplateQueryHandler : IRequestHandler<GetOrderPrintWithTemplateQuery, PrintTemplatePreviewDto>
    {
        private readonly IMediator _mediator;

        public GetOrderPrintWithTemplateQueryHandler(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task<PrintTemplatePreviewDto> Handle(GetOrderPrintWithTemplateQuery request, CancellationToken cancellationToken)
        {
            var renderQuery = new RenderOrderPrintQuery
            {
                OrderId = request.OrderId,
                PrintType = request.PrintType,
                TemplateId = request.TemplateId
            };

            return await _mediator.Send(renderQuery, cancellationToken);
        }
    }
}

