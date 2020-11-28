using Common.DatabaseModels.helpers;
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
        public FontSize FontSize { set; get; }
        public UpdateFontSizeCommand(FontSize FontSize, string Email) : base(Email)
        {
            this.FontSize = FontSize;
        }
    }
}
