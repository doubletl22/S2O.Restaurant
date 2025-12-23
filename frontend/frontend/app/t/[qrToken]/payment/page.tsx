"use client";

import Link from "next/link";
import GuestSessionGate from "../../../components/GuestSessionGate";

export default function PaymentPage({ params }: { params: { qrToken: string } }) {
  const qrToken = params.qrToken;

  return (
    <GuestSessionGate>
      <div className="safe">
        <div className="m-header">
          <div className="m-header-top">
            <div className="m-back" onClick={() => history.back()} title="Quay lại">
              ←
            </div>
            <div className="m-title">
              <b>Thanh toán</b>
              <span>Bàn số {qrToken}</span>
            </div>
            <div className="m-spacer" />
            <div className="m-icon" title="Payment">
              💳
            </div>
          </div>
        </div>

        <div className="panel">
          <b>Yêu cầu thanh toán</b>
          <div className="k" style={{ marginTop: 8 }}>
            Khách bấm nút để gọi xuất hoá đơn / tính tiền (không cần gọi nhân viên).
          </div>

          <div style={{ height: 14 }} />
          <button
            className="btn btn-primary"
            onClick={() => alert("Đã gửi yêu cầu thanh toán (demo).")}
          >
            YÊU CẦU TÍNH TIỀN
          </button>

          <div style={{ height: 10 }} />
          <button
            className="btn btn-ghost"
            onClick={() => alert("Xác thực khách hàng thân thiết (demo).")}
          >
            XÁC THỰC KHÁCH THÂN THIẾT
          </button>

          <div style={{ height: 10 }} />
          <Link className="btn btn-ghost" href={`/t/${qrToken}`}>
            Quay lại thực đơn
          </Link>
        </div>

        <div className="bottom-nav">
          <Link className="nav-item" href={`/t/${qrToken}`} title="Menu">
            🏠
          </Link>
          <Link className="nav-item" href={`/t/${qrToken}/tracking`} title="Theo dõi">
            🧾
          </Link>
          <Link className="nav-center" href={`/t/${qrToken}/cart`} title="Giỏ hàng">
            🛒
          </Link>
          <Link className="nav-item active" href={`/t/${qrToken}/payment`} title="Thanh toán">
            💳
          </Link>
          <span className="nav-item" style={{ opacity: 0.0 }} aria-hidden>
            .
          </span>
        </div>
      </div>
    </GuestSessionGate>
  );
}
