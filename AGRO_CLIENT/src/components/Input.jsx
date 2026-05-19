const Input = ({ 
    name,
    type = 'text',
    value,
    onChange,
    placeHolder = '',
    required = false,
    error = '',
    className = ''
}) => {
    return (
        <div className="w-full">
            <input 
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeHolder}
                className={`w-full bg-white/5 text-white placeholder-white/30 border rounded-xl px-4 py-3 font-poppins text-sm outline-none transition-all duration-200 focus:ring-0 focus:border-successLight/60 focus:bg-white/8 shadow-inner ${error ? 'border-red-500/50 bg-red-950/20' : 'border-white/10'} ${className}`}
            />
            {error && <p className="text-xs font-semibold text-red-400 mt-1.5 font-poppins pl-1">{error}</p>}
        </div>
    )
}

export default Input