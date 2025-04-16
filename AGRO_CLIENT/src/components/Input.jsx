const Input = ({ 
    name,
    type = 'text',
    value,
    onChange,
    placeHolder = '' ,
    required = false,
    error = ''
}) => {
    return(
        <div>
            <input 
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeHolder}
                className={`bg-altBgColor rounded-sm p-2.5 w-xs text-black shadow-2xl font-poppins ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-sm font-bold text-errorColor mt-1 font-poppins break-words w-xs ">{error}</p>}
        </div>
        
    )
}

export default Input