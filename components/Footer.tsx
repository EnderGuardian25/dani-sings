export default function Footer() {
  const year = 2026;
  return (
    <footer className="border-t border-aubergine/20 py-10">
      <div className="container-page flex flex-col items-center justify-between gap-4 text-[12px] text-aubergine/90 md:flex-row">
        <p>© {year} Danella De Cruz. All rights reserved.</p>
        <p className="uppercase tracking-wider2">Made with quiet intent.</p>
      </div>
    </footer>
  );
}
