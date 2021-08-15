
namespace Common.DTO.Notes.FullNoteContent
{
    public enum OperationResultAdditionalInfo
    {
        NoAccessRights,
        NotEnoughMemory,
        FileSizeTooLarge,
        NoSupportExtension,
        NoAnyFile
    }

    public class OperationResult<T>
    {
        public bool Success { set; get; }

        public OperationResultAdditionalInfo? Status { set; get; }

        public string Message { set; get; }

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
            Status = message;
        }

        public OperationResult()
        {

        }

        public OperationResult<T> SetNoPermissions()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.NoAccessRights;
            return this;
        }

        public OperationResult<T> SetNoEnougnMemory()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.NotEnoughMemory;
            return this;
        }

        public OperationResult<T> SetFileSizeTooLarge()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.FileSizeTooLarge;
            return this;
        }

        public OperationResult<T> SetNoSupportExtension()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.NoSupportExtension;
            return this;
        }

        public OperationResult<T> SetNoAnyFile()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.NoAnyFile;
            return this;
        }
    }
}
