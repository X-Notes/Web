using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.labels
{
    public class LabelDTO
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public bool IsDeleted { set; get; }
        public string Color { set; get; }
        public int CountNotes { set; get; }
        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
