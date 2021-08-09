
namespace Common.DTO.Notes.FullNoteContent
{
    public enum OperationResultAdditionalInfo
    {
        NoAccessRights,
        NotEnoughMemory
    }

    public class OperationResult<T>
    {
        public bool Success { set; get; }

        public OperationResultAdditionalInfo? Message { set; get; }

        public T Data { set; get; }

        public OperationResult(bool success, T data)
        {
            this.Success = success;
            this.Data = data;
        }

        public OperationResult(bool success, T data, OperationResultAdditionalInfo message)
        {
            this.Success = success;
            this.Data = data;
            Message = message;
        }

        public OperationResult()
        {

        }

        public OperationResult<T> SetNoPermissions()
        {
            Success = false;
            Message = OperationResultAdditionalInfo.NoAccessRights;
            return this;
        }

        public OperationResult<T> SetNoEnougnMemory()
        {
            Success = false;
            Message = OperationResultAdditionalInfo.NotEnoughMemory;
            return this;
        }

    }
}
