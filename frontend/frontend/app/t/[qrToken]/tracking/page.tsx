"use client";

import Link from "next/link";
import GuestSessionGate from "../../../components/GuestSessionGate";

export default function TrackingPage({ params }: { params: { qrToken: string } }) {
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
              <b>Theo dõi đơn</b>
              <span>Bàn số {qrToken}</span>
            </div>
            <div className="m-spacer" />
            <div className="m-icon" title="Trạng thái">
              🧾
            </div>
          </div>
        </div>

        <div className="panel">
          <b>Trạng thái thời gian thực (demo UI)</b>
          <div style={{ height: 10 }} />

          <div className="row">
            <span className="k">Món #1</span>
            <b>Đang chuẩn bị</b>
          </div>
          <div className="row">
            <span className="k">Món #2</span>
            <b>Đang nấu</b>
          </div>
          <div className="row">
            <span className="k">Món #3</span>
            <b>Đã phục vụ</b>
          </div>

          <div style={{ height: 12 }} />
          <Link className="btn btn-ghost" href={`/t/${qrToken}`}>
            Quay lại thực đơn
          </Link>
        </div>

        <div className="bottom-nav">
          <Link className="nav-item" href={`/t/${qrToken}`} title="Menu">
            🏠
          </Link>
          <Link className="nav-item active" href={`/t/${qrToken}/tracking`} title="Theo dõi">
            🧾
          </Link>
          <Link className="nav-center" href={`/t/${qrToken}/cart`} title="Giỏ hàng">
            🛒
          </Link>
          <Link className="nav-item" href={`/t/${qrToken}/payment`} title="Thanh toán">
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
