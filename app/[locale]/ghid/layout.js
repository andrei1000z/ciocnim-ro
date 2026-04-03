import Script from "next/script";

export const metadata = {
  title: "Ghid de Joc – Cum Joci Ciocnit Ouă Online",
  description: "Ghid complet pentru ciocnit ouă online pe Ciocnim.ro. Cum joci, cum câștigi, cum creezi grupuri și cum deblochezi achievement-uri.",
  keywords: [
    "cum se joaca ciocnit oua online", "ghid ciocnim", "reguli joc oua paste",
    "cum castigi ciocnit oua", "joc oua paste online", "ciocnit oua reguli"
  ],
  openGraph: {
    title: "Ghid de Joc – Ciocnim.ro",
    description: "Învață să joci ciocnit ouă online: reguli, trucuri și ghid pas cu pas.",
    url: "https://ciocnim.ro/ghid",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghid Ciocnit Ouă Online | Ciocnim.ro",
    description: "Reguli, trucuri și ghid pas cu pas pentru jocul de ciocnit ouă online.",
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "https://ciocnim.ro/ghid" },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Acasă", "item": "https://ciocnim.ro" },
    { "@type": "ListItem", "position": 2, "name": "Ghid de Joc", "item": "https://ciocnim.ro/ghid" }
  ]
};

export default function GhidLayout({ children }) {
  return (
    <>
      <Script id="breadcrumb-ghid" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
