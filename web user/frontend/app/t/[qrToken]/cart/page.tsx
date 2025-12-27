<<<<<<< HEAD
"use client";

import Link from "next/link";
import GuestSessionGate from "../../../components/GuestSessionGate";

export default function CartPage({ params }: { params: { qrToken: string } }) {
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
              <b>Giỏ hàng</b>
              <span>Bàn số {qrToken}</span>
            </div>
            <div className="m-spacer" />
            <div className="m-icon" title="Giỏ">
              🛒
            </div>
          </div>
        </div>

        <div className="panel">
          <b>Giỏ hàng (demo)</b>
          <div className="k" style={{ marginTop: 8 }}>
            Hiện tại project của bạn đang chuyển trang “Cart” nhưng chưa có state lưu món.
            Nếu bạn muốn, mình sẽ giúp bạn lưu cart theo session/qrToken.
          </div>

          <div style={{ height: 12 }} />
          <button className="btn btn-primary" onClick={() => (location.href = `/t/${qrToken}/payment`)}>
            Tiếp tục thanh toán
          </button>

          <div style={{ height: 10 }} />
          <button className="btn btn-ghost" onClick={() => (location.href = `/t/${qrToken}`)}>
            Tiếp tục chọn món
          </button>
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
=======
"use client";

import Link from "next/link";
import GuestSessionGate from "../../../components/GuestSessionGate";

export default function CartPage({ params }: { params: { qrToken: string } }) {
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
              <b>Giỏ hàng</b>
              <span>Bàn số {qrToken}</span>
            </div>
            <div className="m-spacer" />
            <div className="m-icon" title="Giỏ">
              🛒
            </div>
          </div>
        </div>

        <div className="panel">
          <b>Giỏ hàng (demo)</b>
          <div className="k" style={{ marginTop: 8 }}>
            Hiện tại project của bạn đang chuyển trang “Cart” nhưng chưa có state lưu món.
            Nếu bạn muốn, mình sẽ giúp bạn lưu cart theo session/qrToken.
          </div>

          <div style={{ height: 12 }} />
          <button className="btn btn-primary" onClick={() => (location.href = `/t/${qrToken}/payment`)}>
            Tiếp tục thanh toán
          </button>

          <div style={{ height: 10 }} />
          <button className="btn btn-ghost" onClick={() => (location.href = `/t/${qrToken}`)}>
            Tiếp tục chọn món
          </button>
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
>>>>>>> b6136e036fc676c4b81d4adbb0e4f55082d26efd
