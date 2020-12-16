using Common.DTO.orders;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.orders
{
    public class UpdateOrderCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public OrderEntity OrderEntity { set; get; }
        [Required]
        public int Position { set; get; }
        [Required]
        public string EntityId { set; get; }
    }
}
