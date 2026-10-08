export default function FormField({
                                    title,
                                    children,
                                  }: {
  title: string;
  children: any;
}) {
  return (
      <div className="w-full">
        <p className="text-xs mb-1.5 sm:mb-1 text-gray-600 uppercase font-medium">
          {title}
        </p>
        {children}
      </div>
  );
}