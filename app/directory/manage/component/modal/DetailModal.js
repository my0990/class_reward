import { useState } from "react";
import CardTemplate from "../card/CardTemplate";
export default function DetailModal({picked}) {
    return (
        <div>
            <dialog id="my_modal_4" className="modal">
                <div className="modal-box max-w-[352px] flex p-[8px] bg-green-400 justify-center">
                    <CardTemplate picked={picked}/>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}