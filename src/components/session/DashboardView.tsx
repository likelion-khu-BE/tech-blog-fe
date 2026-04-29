import { ratingData, uploadData, keywords } from '../../data/session-mock'

export function DashboardView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-12 border-b border-border-default flex-shrink-0">
        <span className="text-sm font-medium text-text-primary flex-1">14기 활동 대시보드</span>
        <span className="text-xs text-text-tertiary">2025.05.01 ~ 현재</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '총 세션', value: '10', sub: '3주차 진행중' },
            { label: '총 자료', value: '28', sub: '슬라이드 8 · 코드 5' },
            { label: '총 노트', value: '34', sub: '평균 3.4개/세션' },
            { label: '회고 작성률', value: '71%', highlight: true, sub: '34 / 48명' },
          ].map((s) => (
            <div key={s.label} className="bg-bg-tertiary border border-border-default rounded-lg p-4">
              <div className="text-xs text-text-tertiary mb-1.5">{s.label}</div>
              <div className={`text-2xl font-semibold ${s.highlight ? 'text-[#4ADE80]' : 'text-text-primary'}`}>{s.value}</div>
              <div className="text-[11px] text-text-tertiary mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border-default rounded-lg p-4">
            <div className="text-sm font-medium text-text-primary mb-3">세션별 평균 별점</div>
            <div className="space-y-2.5">
              {ratingData.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="text-[11px] text-text-tertiary w-28 flex-shrink-0 truncate">{r.label}</span>
                  <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F59E0B] rounded-full"
                      style={{ width: `${(r.value / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#F59E0B] w-6 text-right">{r.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border-default rounded-lg p-4">
            <div className="text-sm font-medium text-text-primary mb-3">주차별 자료 업로드</div>
            <div className="space-y-2.5">
              {uploadData.map((u) => (
                <div key={u.label} className="flex items-center gap-2">
                  <span className="text-xs text-text-tertiary w-7 flex-shrink-0">{u.label}</span>
                  <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-primary rounded-full"
                      style={{ width: `${(u.count / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text-primary w-4 text-right">{u.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-border-default rounded-lg p-4">
          <div className="text-sm font-medium text-text-primary mb-3">면접 대비 핵심 키워드</div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="text-xs px-3 py-1.5 rounded-md border border-border-default text-text-secondary font-mono"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
