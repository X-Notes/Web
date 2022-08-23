namespace Common.DTO
{
    public enum OperationResultAdditionalInfo
    {
        NoAccessRights,
        NotEnoughMemory,
        FileSizeTooLarge,
        NoSupportExtension,
        NoAnyFile,
        RequestCancelled,
        NotFound,
        AnotherError,
        ContentLocked,
        BillingError
    }

    public class OperationResult<T>
    {
        public bool Success { set; get; }

        public OperationResultAdditionalInfo? Status { set; get; }

        public string Message { set; get; }

        public T Data { set; get; }

        public OperationResult(bool success, T data)
        {
            Success = success;
            Data = data;
        }

        public OperationResult(bool success, T data, OperationResultAdditionalInfo? status, string message = null)
        {
            Success = success;
            Data = data;
            Status = status;
            Message = message;
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

        public OperationResult<T> SetRequestCancelled()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.RequestCancelled;
            return this;
        }

        public OperationResult<T> SetNotFound()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.NotFound;
            return this;
        }

        public OperationResult<T> SetAnotherError()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.AnotherError;
            return this;
        }

        public OperationResult<T> SetContentLocked()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.ContentLocked;
            return this;
        }
        
        public OperationResult<T> SetBillingError()
        {
            Success = false;
            Status = OperationResultAdditionalInfo.BillingError;
            return this;
        }
    }
}
