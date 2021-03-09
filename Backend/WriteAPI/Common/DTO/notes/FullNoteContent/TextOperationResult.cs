using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.notes.FullNoteContent
{
    public class TextOperationResult<T>
    {
        public bool Success { set; get; }
        public T Data { set; get; }

        public TextOperationResult(bool Success, T Data)
        {
            this.Success = Success;
            this.Data = Data;
        }
    }
}
