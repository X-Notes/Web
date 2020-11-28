﻿using Common.DatabaseModels.helpers;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.notes
{
    public class ArchiveNoteCommand : BaseCommandEntity, IRequest<Unit> 
    {
        [Required]
        public List<string> Ids { set; get; }
        public ArchiveNoteCommand(string email) : base(email)
        {

        }
    }
}
