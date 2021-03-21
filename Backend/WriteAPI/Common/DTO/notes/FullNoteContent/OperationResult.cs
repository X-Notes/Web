
namespace Common.DTO.notes.FullNoteContent
{
    public class OperationResult<T>
    {
        public bool Success { set; get; }
        public T Data { set; get; }

        public OperationResult(bool Success, T Data)
        {
            this.Success = Success;
            this.Data = Data;
        }
    }
}
