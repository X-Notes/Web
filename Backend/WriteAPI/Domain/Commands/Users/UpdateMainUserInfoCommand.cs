﻿using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Users
{
    public class UpdateMainUserInfoCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public string Name { set; get; }
    }
}