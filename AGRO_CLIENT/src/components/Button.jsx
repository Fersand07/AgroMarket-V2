const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    disabled = false,
    className = '',
}) => {
    const baseStyle = `px-4 py-3 rounded font-semibold transition duration-200 ease-in-out ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`
    const variants = {
        primary: 'text-white font-poppins bg-primaryAltDark hover:bg-hoverBtnColor',
        secondary: 'bg-gray-300 text-black hover:bg-gray-400 hover:cursor-not-allowed',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        success: 'bg-green-500 text-white hover:bg-green-600',
    }

    const finalClass = `${baseStyle} ${variants[variant]} ${className}`

    return(
        <button
            type={type}
            onClick={onClick}
            disabled = {disabled}
            className={finalClass}
        >
            {children}
        </button>
    )
}

export default Button