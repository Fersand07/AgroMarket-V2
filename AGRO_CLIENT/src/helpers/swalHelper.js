import Swal from 'sweetalert2';

/**
 * Custom glassmorphic pre-styled SweetAlert2 instance.
 * Disables default buttons styling to apply our custom Tailwind CSS v4 classes
 * matching the premium dark esmeralda theme of AgroMarket.
 */
export const customSwal = Swal.mixin({
  background: '#09110a',
  color: '#ffffff',
  confirmButtonColor: '#A4D6A0',
  cancelButtonColor: 'rgba(239, 68, 68, 0.2)',
  customClass: {
    container: 'backdrop-blur-md bg-black/60',
    popup: 'rounded-3xl border border-white/10 backdrop-blur-xl bg-[#09110a]/90 shadow-[0_20px_50px_rgba(0,0,0,0.8)] font-poppins p-6 md:p-8 animate-fade-in',
    title: 'font-poppins font-black text-xl text-white tracking-wide mb-2',
    htmlContainer: 'font-poppins text-white/70 text-sm leading-relaxed mb-6',
    confirmButton: 'bg-successLight text-primaryAltDark hover:bg-white hover:text-green-950 font-black uppercase tracking-widest text-[10px] px-6 py-3.5 rounded-xl transition-all duration-300 border border-successLight/10 hover:border-white shadow-[0_4px_14px_rgba(164,214,160,0.3)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.2)] focus:ring-0 focus:outline-none cursor-pointer',
    cancelButton: 'bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 font-black uppercase tracking-widest text-[10px] px-6 py-3.5 rounded-xl transition-all duration-300 focus:ring-0 focus:outline-none ml-3 cursor-pointer'
  },
  buttonsStyling: false
});

