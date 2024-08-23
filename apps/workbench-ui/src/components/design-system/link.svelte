<a
	{...$$restProps}
	href={$$restProps.href}
	class={`text-primary-500 focus:ring-primary-100 focus:border-primary-500 rounded outline-none hover:underline focus:ring-4 ${$$restProps.class ?? ''}`}
>
	<slot />
</a>
