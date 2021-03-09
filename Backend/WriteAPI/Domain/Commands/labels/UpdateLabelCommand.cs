using Common.Attributes;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.labels
{
    public class UpdateLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuidAttribute]
        public Guid Id { set; get; }
        [Required]
        public string Name { set; get; }
        [Required]
        public string Color { set; get; }
        public UpdateLabelCommand(string email)
            :base(email)
        {

        }
    }
}
