using Common.Attributes;
using Common.DatabaseModels.models.Systems;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.users
{
    public class UpdateFontSizeCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public FontSizeENUM Id { set; get; }
        public UpdateFontSizeCommand(FontSizeENUM Id, string Email) : base(Email)
        {
            this.Id = Id;
        }
    }
}
