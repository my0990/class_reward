export default function DialBtn({ children, color, isactive, disabled, onClick, onPointerDown }) {
  return (
    <li
      onClick={disabled ? undefined : onClick}
      onPointerDown={disabled ? undefined : onPointerDown}
      aria-disabled={disabled || undefined}
      className={`active:bg-red-300 shadow-[3px_3px_0px_1px_#808080a6] mb-[20px] rounded-3xl cursor-pointer ${color === 'red' ? 'bg-red-300' : 'bg-orange-300'} ${isactive ? 'bg-red-300' : ''} ${disabled ? 'opacity-40 pointer-events-none' : ''} w-[72px] h-[64px] m-[4px] text-[1.4rem] flex justify-center items-center`}
    >
      {children}
    </li>
  );
}
