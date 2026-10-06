import Link from "next/link";
import { SITE } from "@/config/siteInfo";
import Footer from "@/components/ui/common/Footer";

export const metadata = { title: `개인정보처리방침 - ${SITE.name}` };

const mail = <a href={`mailto:${SITE.contactEmail}`} className="text-orange-600 underline">{SITE.contactEmail}</a>;

function Section({ n, title, children }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold text-gray-900">
        {n}. {title}
      </h2>
      <div className="space-y-2 text-[15px] leading-7 text-gray-700">{children}</div>
    </section>
  );
}

function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-orange-50">
            {head.map((h) => (
              <th key={h} className="border border-gray-200 px-3 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="border border-gray-200 px-3 py-2 align-top">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Ul = ({ items }) => (
  <ul className="list-disc space-y-1 pl-5">
    {items.map((t, i) => <li key={i}>{t}</li>)}
  </ul>
);

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <main className="mx-auto w-full max-w-[820px] flex-1 px-4 py-10">
        <Link href="/" className="text-sm text-gray-500 hover:underline">← {SITE.name} 처음으로</Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">개인정보처리방침</h1>
        <p className="mt-3 text-[15px] leading-7 text-gray-700">
          {SITE.name}(이하 &apos;서비스&apos;)는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 원활하게
          처리할 수 있도록 다음과 같이 개인정보처리방침을 공개합니다.
        </p>

        <Section n={1} title="개인정보의 처리 목적">
          <Ul items={[
            "교사 회원 가입, 본인(이메일) 확인, 계정 관리",
            "학급 화폐·아이템·퀘스트 등 학급 관리 기능 제공",
            "학생 계정 로그인 및 학급 활동 기록 제공",
            "부정 이용 방지(인증 메일·로그인 시도 제한) 및 서비스 안정성 확보",
            "공지 전달, 문의 응대, 서비스 이용 통계 분석",
          ]} />
        </Section>

        <Section n={2} title="처리하는 개인정보 항목">
          <Table
            head={["구분", "항목"]}
            rows={[
              ["교사 회원 (필수)", "이메일 주소, 비밀번호(암호화 저장), 가입·인증·최근 접속 일시"],
              ["학생 계정 (교사가 생성)", "학급별 아이디(학급 별명 + 번호), 비밀번호(암호화 저장), 무작위 생성 별명, 학생이 직접 입력한 별명·상태 메시지, 화폐·아이템·퀘스트 이용 기록, 최근 접속 일시"],
              ["자동 수집", "접속 기록, 인증 메일 요청 시 IP 주소, 로그인 유지를 위한 쿠키, 방문 통계(Google Analytics) 정보"],
            ]}
          />
          <p>학생 계정은 실명, 연락처, 생년월일 등 학생 개인을 직접 알아볼 수 있는 정보를 받지 않도록 만들어져 있습니다.</p>
        </Section>

        <Section n={3} title="개인정보의 보유 및 이용 기간">
          <Table
            head={["정보", "보유 기간"]}
            rows={[
              ["교사 회원 정보", "회원 탈퇴 시까지 (탈퇴하면 즉시 삭제)"],
              ["학생 계정과 학급 정보", "교사가 계정이나 학급을 삭제할 때까지. 삭제한 학급은 30일 동안 복구할 수 있고 그 뒤 영구 삭제. 교사가 탈퇴하면 즉시 삭제"],
              ["화폐·아이템 이용 기록", "기록일로부터 30일 후 자동 삭제"],
              ["이메일 인증 코드", "10분 (사용 후 삭제)"],
              ["인증 메일 발송 기록 (이메일, IP 주소)", "2일 후 자동 삭제"],
              ["로그인 실패 기록", "1일 후 자동 삭제"],
            ]}
          />
          <p>다른 법령에서 보관을 요구하는 경우에는 그 기간 동안 보관합니다.</p>
        </Section>

        <Section n={4} title="개인정보의 파기 절차 및 방법">
          <p>보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자 파일 형태의 정보는 복구할 수 없는 방법으로 데이터베이스에서 영구 삭제하며, 기간이 정해진 정보는 자동 삭제 기능으로 파기합니다.</p>
        </Section>

        <Section n={5} title="개인정보의 제3자 제공">
          <p>서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 특별한 규정이 있는 경우는 예외로 합니다.</p>
        </Section>

        <Section n={6} title="개인정보 처리의 위탁 및 국외 이전">
          <p>서비스 운영을 위해 아래 업체에 개인정보 처리를 맡기고 있으며, 이 업체들의 서버가 국외에 있어 개인정보가 국외로 이전됩니다. 정보는 서비스 이용 시 네트워크를 통해 수시로 전송되며, 보유 기간은 위탁 계약 종료 또는 제3항의 기간까지입니다.</p>
          <Table
            head={["받는 자", "국가", "위탁 업무", "이전 항목"]}
            rows={[
              ["Vercel Inc.", "미국", "웹 서비스 운영(호스팅)", "서비스 이용 과정의 모든 정보"],
              ["MongoDB, Inc. (Atlas)", "미국 등 (클라우드 리전)", "데이터베이스 저장", "제2항의 모든 정보"],
              ["Resend, Inc.", "미국", "회원가입 인증 메일 발송", "이메일 주소"],
              ["Google LLC", "미국", "방문 통계 분석 (Google Analytics)", "쿠키, 접속 기기·페이지 정보"],
            ]}
          />
          <p>국외 이전을 원하지 않으시면 서비스 이용을 중단하고 탈퇴하실 수 있습니다. 다만 이 경우 서비스를 이용할 수 없습니다. 방문 통계는 브라우저에서 쿠키를 차단해 거부할 수 있습니다.</p>
        </Section>

        <Section n={7} title="만 14세 미만 아동의 개인정보">
          <Ul items={[
            "학생 계정은 담임 교사가 수업 운영을 위해 만들며, 학생에게서 실명·연락처 등 개인을 알아볼 수 있는 정보를 수집하지 않습니다.",
            "교사는 학생 별명이나 학급 이름에 학생 실명 등 개인정보를 넣지 않도록 해 주시기 바랍니다.",
            "보호자는 담임 교사 또는 아래 문의처를 통해 자녀 계정의 정보 열람이나 삭제를 요청할 수 있습니다.",
          ]} />
        </Section>

        <Section n={8} title="정보주체의 권리와 행사 방법">
          <p>이용자(학생의 경우 보호자 포함)는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. {mail}로 요청하시면 지체 없이 조치하겠습니다. 교사 회원은 설정 화면 또는 학급 선택 화면의 '회원 탈퇴'에서 직접 탈퇴할 수 있으며, 탈퇴하면 계정과 모든 학급·학생 정보가 즉시 삭제됩니다. 학생 계정 정보는 담임 교사가 학급 화면에서 직접 수정하거나 삭제할 수도 있습니다.</p>
        </Section>

        <Section n={9} title="개인정보의 안전성 확보 조치">
          <Ul items={[
            "비밀번호는 복호화할 수 없는 방식(bcrypt)으로 암호화해 저장합니다.",
            "모든 통신은 암호화(HTTPS)됩니다.",
            "개인정보에 접근할 수 있는 사람을 운영자로 최소화하고, 관리자 작업은 기록으로 남깁니다.",
            "인증 메일 발송과 로그인 시도 횟수를 제한해 무단 접근을 막습니다.",
          ]} />
        </Section>

        <Section n={10} title="쿠키의 설치·운영 및 거부">
          <p>서비스는 로그인 상태를 유지하기 위한 쿠키와 방문 통계를 위한 Google Analytics 쿠키를 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 로그인 유지 쿠키를 거부하면 서비스에 로그인할 수 없습니다.</p>
        </Section>

        <Section n={11} title="개인정보 보호책임자">
          <Ul items={[
            <>책임자: {SITE.privacyOfficer}</>,
            <>연락처: {mail}</>,
          ]} />
        </Section>

        <Section n={12} title="권익침해 구제 방법">
          <p>개인정보 침해에 대한 신고나 상담이 필요하시면 아래 기관에 문의하실 수 있습니다.</p>
          <Ul items={[
            "개인정보침해신고센터: (국번 없이) 118, privacy.kisa.or.kr",
            "개인정보분쟁조정위원회: 1833-6972, www.kopico.go.kr",
            "대검찰청: (국번 없이) 1301, www.spo.go.kr",
            "경찰청: (국번 없이) 182, ecrm.police.go.kr",
          ]} />
        </Section>

        <Section n={13} title="개인정보처리방침의 변경">
          <p>이 개인정보처리방침은 {SITE.privacyEffectiveDate}부터 적용됩니다. 내용이 바뀌면 공지사항을 통해 알려드립니다.</p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
