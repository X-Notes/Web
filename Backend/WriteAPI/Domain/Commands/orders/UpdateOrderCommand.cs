using Common.DTO.orders;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.orders
{
    public class UpdateOrderCommand : BaseCommandEntity, IRequest<Unit>
    {
        public OrderEntity OrderEntity { set; get; }
        public int Position { set; get; }
        public string EntityId { set; get; }
    }
}
